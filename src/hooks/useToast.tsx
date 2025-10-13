import { toast, ToastOptions } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

export const useToast = () => {
  const { theme } = useTheme();

  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: theme === "dark" ? "dark" : "light",
  };

  return {
    success: (message: string, options?: ToastOptions) =>
      toast.success(message, { ...defaultOptions, ...options }),

    error: (message: string, options?: ToastOptions) =>
      toast.error(message, { ...defaultOptions, ...options }),

    warning: (message: string, options?: ToastOptions) =>
      toast.warning(message, { ...defaultOptions, ...options }),

    info: (message: string, options?: ToastOptions) =>
      toast.info(message, { ...defaultOptions, ...options }),
  };
};
