const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const sections = [
    {
      title: 'Original Text',
      content: result.original_text,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Summary',
      content: result.summary,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Key Points',
      content: result.bullet_points,
      isList: true,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Rewritten Text',
      content: result.rewritten_text,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Processing Results</h2>
          <span className="text-sm text-gray-500">File: {result.filename}</span>
        </div>
      </div>

      {sections.map((section, index) => (
        <div
          key={index}
          className={`${section.bgColor} rounded-lg shadow-md p-6 border ${section.borderColor}`}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {section.title}
          </h3>
          {section.isList ? (
            <ul className="space-y-2">
              {Array.isArray(section.content) && section.content.length > 0 ? (
                section.content.map((point, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No key points available</li>
              )}
            </ul>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {section.content || 'No content available'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResultDisplay;
