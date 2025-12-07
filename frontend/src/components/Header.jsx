import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">✨</div>
            <h1 className="text-2xl font-bold text-gray-900">DocSpark AI</h1>
          </Link>
          <nav className="flex space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
