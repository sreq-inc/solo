import { Code } from "lucide-react";
import { SelectMethod } from "./SelectMethod";

type RequestFormProps = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload: string;
  loading: boolean;
  onMethodChange: (method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => void;
  onUrlChange: (url: string) => void;
  onPayloadChange: (payload: string) => void;
  onSendRequest: () => void;
};

export const RequestForm = ({
  method,
  url,
  payload,
  loading,
  onMethodChange,
  onUrlChange,
  onPayloadChange,
  onSendRequest,
}: RequestFormProps) => {
  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      <h2 className="text-xl font-bold flex items-center">
        <Code className="mr-2 text-purple-600" /> HTTP Request
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 mr-2">
          <SelectMethod
            value={method}
            options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
            onChange={(value) =>
              onMethodChange(
                value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
              )
            }
          />
        </div>
        <div className="flex-grow">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onSendRequest}
            disabled={loading}
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-2">JSON Payload (optional)</label>
        <textarea
          value={payload}
          onChange={(e) => onPayloadChange(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full p-2 border rounded h-32"
        />
      </div>
    </div>
  );
};
