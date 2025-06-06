import clsx from "clsx";
import { useRequest } from "../context/RequestContext";
import { useVariables } from "../context/VariablesContext";
import { SelectMethod } from "./SelectMethod";
import { SmartUrlInput } from "./SmartUrlInput";
import { useTheme } from "../context/ThemeContext";

export const InputMethod = () => {
  const { method, url, loading, setMethod, setUrl, handleRequest } =
    useRequest();
  const { replaceVariablesInUrl } = useVariables();
  const { theme } = useTheme();

  const handleRequestWithVariables = async () => {
    console.log("🚀 INICIANDO REQUISIÇÃO");
    console.log("📝 URL original:", url);

    // Primeiro, substitui as variáveis na URL
    const processedUrl = replaceVariablesInUrl(url);

    console.log("✅ URL após substituição:", processedUrl);
    console.log("🔄 URLs são diferentes?", url !== processedUrl);

    // Verifica se ainda há variáveis não resolvidas
    if (processedUrl.includes("{{")) {
      const unresolvedVars = processedUrl.match(/\{\{[^}]+\}\}/g);
      console.error("❌ Variáveis não resolvidas:", unresolvedVars);
      alert(
        `Algumas variáveis não estão definidas: ${unresolvedVars?.join(
          ", "
        )}\nVerifique a aba Variables.`
      );
      return;
    }

    // Verifica se a URL processada está vazia
    if (!processedUrl.trim()) {
      console.error("❌ URL vazia após processamento");
      alert("URL é obrigatória");
      return;
    }

    // Verifica se a URL processada tem protocolo válido
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      console.error("❌ URL sem protocolo válido:", processedUrl);
      alert(
        `URL deve começar com http:// ou https://\nURL atual: "${processedUrl}"`
      );
      return;
    }

    console.log(
      "✅ Validações passaram, fazendo requisição para:",
      processedUrl
    );
    console.log("📡 Passando URL processada diretamente para handleRequest...");

    try {
      // Passa a URL processada diretamente para handleRequest
      await handleRequest(processedUrl);
      console.log("✅ Requisição concluída com sucesso");
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-24 mr-2">
        <SelectMethod
          value={method}
          options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
          onChange={(value) =>
            setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
          }
        />
      </div>
      <div className="flex-grow">
        <SmartUrlInput
          value={url}
          onChange={setUrl}
          placeholder="https://api.example.com/users ou {{baseUrl}}/users"
          className={clsx(
            "w-full h-10 p-2 border rounded outline-none focus:ring-0",
            theme === "dark"
              ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
              : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
          )}
        />
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={handleRequestWithVariables}
          disabled={loading}
          className={clsx(
            "p-2 h-10 text-white rounded cursor-pointer w-28",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
