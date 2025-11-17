import { alpha, createTheme } from "@mui/material/styles";

const primaryMain = "#1e88e5";
const secondaryMain = "#43a047";
const neutral900 = "#1a1c1f";
const neutral600 = "#5f6a86";
const backgroundDefault = "#f3f6fb";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryMain,
      light: "#63a4ff",
      dark: "#0d47a1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: secondaryMain,
      light: "#76d275",
      dark: "#00701a",
      contrastText: "#ffffff",
    },
    info: {
      main: "#008dce",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ffb74d",
    },
    error: {
      main: "#e53935",
    },
    background: {
      default: backgroundDefault,
      paper: "#ffffff",
    },
    text: {
      primary: neutral900,
      secondary: neutral600,
    },
    divider: alpha(neutral600, 0.12),
  },
  typography: {
    fontFamily: ['"Poppins"', '"Roboto"', '"Segoe UI"', "sans-serif"].join(", "),
    h1: { fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0px 2px 4px rgba(15, 23, 42, 0.06)",
    "0px 4px 12px rgba(15, 23, 42, 0.08)",
    "0px 8px 20px rgba(15, 23, 42, 0.1)",
    "0px 12px 32px rgba(15, 23, 42, 0.12)",
    ...Array(20).fill("0px 18px 40px rgba(15, 23, 42, 0.12)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        body: {
          backgroundColor: backgroundDefault,
          color: neutral900,
        },
        a: {
          color: primaryMain,
          textDecoration: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "default",
      },
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: neutral900,
          borderBottom: `1px solid ${alpha(neutral600, 0.12)}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 72,
          "@media (max-width:600px)": {
            minHeight: 64,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
          boxShadow: "0px 12px 40px rgba(15, 23, 42, 0.12)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(neutral600, 0.08)}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(neutral600, 0.08)}`,
          boxShadow: "0px 18px 40px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
        },
        sizeLarge: {
          paddingBlock: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(primaryMain, 0.6),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: primaryMain,
            boxShadow: `0 0 0 4px ${alpha(primaryMain, 0.1)}`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: primaryMain,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginInline: 12,
          marginBlock: 4,
          paddingBlock: 10,
          "&.Mui-selected": {
            backgroundColor: alpha(primaryMain, 0.12),
            color: primaryMain,
            "& .MuiListItemIcon-root": {
              color: primaryMain,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: neutral600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(primaryMain, 0.1),
          color: primaryMain,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(neutral600, 0.12),
        },
      },
    },
  },
});

export default theme;


