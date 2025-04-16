import clsx from "clsx";
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
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="useBasicAuth"
          checked={useBasicAuth}
          onChange={(e) => onUseBasicAuthChange(e.target.checked)}
          className="mr-2"
        />
        <label
          htmlFor="useBasicAuth"
          className={clsx(
            "text-sm font-medium",
            theme === "dark" ? "text-white" : "text-gray-700",
          )}
        >
          Use Basic Authentication
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className={clsx(
              "block text-sm mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700",
            )}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Username"
            className={clsx(
              "w-full p-2 border rounded text-sm",
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800",
            )}
          />
        </div>
        <div>
          <label
            className={clsx(
              "block text-sm mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700",
            )}
          >
            Password
          </label>
          <div className="flex flex-col gap-4 justify-start">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Password"
              className={clsx(
                "w-full p-2 border rounded text-sm",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-800",
              )}
            />
            <button
              className="cursor-pointer text-left"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="text-sm text-gray-500 hover:text-gray-700">
                {showPassword ? "Hide" : "Show"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
