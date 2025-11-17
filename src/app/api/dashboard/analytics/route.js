"use server";

import { NextResponse } from "next/server";
import { Op, fn, col, literal } from "sequelize";
import { initAssociations, Agendamento, Atividade, Aluno } from "@/server/db/models";

function normalizeMonthLabel(value) {
  if (!value) return null;
  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) return null;
  return dateValue.toISOString();
}

function ensureNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export async function GET() {
  try {
    initAssociations();

    const today = new Date();
    const pastSixMonths = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const formatDateOnly = (date) => date.toISOString().slice(0, 10);
    const todayDateOnly = formatDateOnly(startOfToday);
    const weekStartDateOnly = formatDateOnly(startOfWeek);
    const weekEndDateOnly = formatDateOnly(endOfWeek);
    const monthStartDateOnly = formatDateOnly(startOfMonth);
    const monthEndDateOnly = formatDateOnly(endOfMonth);

    const atendimentosPorMesRaw = await Agendamento.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("data")), "periodo"],
        [fn("COUNT", col("id")), "total"],
      ],
      where: {
        data: { [Op.gte]: pastSixMonths },
      },
      group: [fn("DATE_TRUNC", "month", col("data"))],
      order: [[fn("DATE_TRUNC", "month", col("data")), "ASC"]],
      raw: true,
    });

    const atendimentosPorMes = atendimentosPorMesRaw.map((item) => ({
      periodo: normalizeMonthLabel(item.periodo),
      total: ensureNumber(item.total),
    }));

    const topTiposAtividadeRaw = await Agendamento.findAll({
      attributes: [
        [col("atividade.tipo"), "tipo"],
        [fn("COUNT", col("agendamento.id")), "total"],
      ],
      include: [
        {
          model: Atividade,
          as: "atividade",
          attributes: [],
          required: false,
        },
      ],
      where: {
        data: {
          [Op.gte]: monthStartDateOnly,
          [Op.lt]: monthEndDateOnly,
        },
      },
      group: [col("atividade.tipo")],
      order: [[literal("total"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const topTiposAtividade = topTiposAtividadeRaw.map((item) => ({
      tipo: item.tipo ?? "Não definido",
      total: ensureNumber(item.total),
    }));

    const statusResumoRaw = await Agendamento.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "total"],
      ],
      group: ["status"],
      raw: true,
    });

    const statusResumo = statusResumoRaw.map((item) => ({
      status: item.status ?? "sem status",
      total: ensureNumber(item.total),
    }));

    const totalAlunos = await Aluno.count();

    const totalAtendimentosHoje = await Agendamento.count({
      where: {
        data: todayDateOnly,
      },
    });

    const totalAtendimentosSemana = await Agendamento.count({
      where: {
        data: {
          [Op.gte]: weekStartDateOnly,
          [Op.lt]: weekEndDateOnly,
        },
      },
    });

    const response = {
      charts: {
        atendimentosPorMes,
        topTiposAtividade,
        statusResumo,
      },
      totals: {
        totalAlunos,
        totalAtendimentosHoje,
        totalAtendimentosSemana,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[dashboard/analytics] erro ao gerar analytics:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os dados analíticos." },
      { status: 500 }
    );
  }
}


