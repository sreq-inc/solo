import { Code } from "lucide-react";

type ResponseViewProps = {
  response: any;
  error: string | null;
  loading: boolean;
  onCopyResponse: () => void;
};

export const ResponseView = ({
  response,
  error,
  loading,
  onCopyResponse,
}: ResponseViewProps) => {
  const lines = response ? JSON.stringify(response, null, 2).split("\n") : [];

  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      <h2 className="text-xl font-bold flex items-center">
        <Code className="mr-2 text-purple-600" /> Response
      </h2>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>
      )}
      <div className="relative bg-gray-100 rounded min-h-[600px] h-96 overflow-auto font-mono">
        <table className="w-full table-fixed">
          <tbody>
            {loading ? (
              <tr>
                <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300">
                  1
                </td>
                <td className="pl-4">Loading...</td>
              </tr>
            ) : !response ? (
              <tr>
                <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300">
                  1
                </td>
                <td className="pl-4">No response yet</td>
              </tr>
            ) : (
              lines.map((line, i) => (
                <tr key={i} className="hover:bg-gray-200">
                  <td className="text-right pr-4 select-none text-gray-500 w-12 border-r border-gray-300 sticky left-0 bg-gray-100">
                    {i + 1}
                  </td>
                  <td className="pl-4 whitespace-pre overflow-x-auto">
                    {line}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {response && (
        <button
          onClick={onCopyResponse}
          className="w-full p-2 bg-purple-200 text-purple-800 rounded hover:bg-purple-300"
        >
          Copy Response
        </button>
      )}
    </div>
  );
};
