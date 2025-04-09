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
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded min-h-[600px] h-96 overflow-auto font-mono transition-colors">
        <table className="w-full table-fixed">
          <tbody>
            {loading ? (
              <tr>
                <td className="text-right pr-4 select-none text-gray-500 dark:text-gray-400 w-12 border-r border-gray-300 dark:border-gray-600">
                  1
                </td>
                <td className="pl-4 dark:text-gray-300">Loading...</td>
              </tr>
            ) : !response ? (
              <tr>
                <td className="text-right pr-4 select-none text-gray-500 dark:text-gray-400 w-12 border-r border-gray-300 dark:border-gray-600">
                  1
                </td>
                <td className="pl-4 dark:text-gray-300">No response yet</td>
              </tr>
            ) : (
              lines.map((line, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <td className="text-right pr-4 select-none text-gray-500 dark:text-gray-400 w-12 border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-800">
                    {i + 1}
                  </td>
                  <td className="pl-4 whitespace-pre overflow-x-auto dark:text-gray-300">
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
          className="w-full p-2 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors"
        >
          Copy Response
        </button>
      )}
    </div>
  );
};
