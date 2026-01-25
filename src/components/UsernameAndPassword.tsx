import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export type UsernameAndPasswordProps = {
  username: string;
  password: string;
  useBasicAuth: boolean;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (password: string) => void;
  onUseBasicAuthChange: (useBasicAuth: boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
};

export const UsernameAndPassword = ({
  username,
  password,
  useBasicAuth,
  onUsernameChange,
  onPasswordChange,
  onUseBasicAuthChange,
  showPassword,
  setShowPassword,
}: UsernameAndPasswordProps) => {
  const { theme } = useTheme();

  return (
    <section>
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="useBasicAuth"
          checked={useBasicAuth}
          onChange={(e) => onUseBasicAuthChange(e.target.checked)}
          className="mr-2"
        />
        <label
          htmlFor="useBasicAuth"
          className={clsx("text-sm font-medium cursor-pointer", theme === "dark" ? "text-white" : "text-gray-700")}
        >
          Use Basic Authentication
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Username"
            className={clsx(
              "w-full h-10 p-2 border rounded-md outline-none",
              theme === "dark"
                ? "bg-gray-800 text-gray-200 border-gray-700"
                : "bg-white text-gray-700 border-gray-300"
            )}
          />
        </div>
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Password"
              className={clsx(
                "w-full h-10 p-2 pr-10 border rounded-md outline-none",
                theme === "dark"
                  ? "bg-gray-800 text-gray-200 border-gray-700"
                  : "bg-white text-gray-700 border-gray-300"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={clsx(
                "absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer",
                theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              )}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
