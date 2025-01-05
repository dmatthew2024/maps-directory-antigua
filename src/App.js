import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const MapsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Restaurants');
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const categories = [
    'Restaurants',
    'Gas Stations',
    'Government',
    'Hardware Stores',
    'Medical Clinics'
  ];

  const getCsvPath = (category) => {
    // Add the base path for GitHub Pages
    const basePath = '/maps-directory-antigua';
    const paths = {
      'Restaurants': '/data/R8_google_maps_data.csv',
      'Gas Stations': '/data/gas_stations_google_maps_data.csv',
      'Government': '/data/government_departments_google_maps_data.csv',
      'Hardware Stores': '/data/hardware_store_google_maps_data.csv',
      'Medical Clinics': '/data/medical_clinic_google_maps_data.csv'
    };
    return `${basePath}${paths[category]}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(getCsvPath(selectedCategory));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            setData(results.data);
            setError(null);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Error parsing data');
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading data');
        setData([]);
      }
    };

    loadData();
  }, [selectedCategory]);

  const filteredData = data.filter(item => {
    if (!showAll && !searchTerm) return false;
    if (!searchTerm && showAll) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.Name?.toLowerCase().includes(searchLower)) ||
      (item.Address?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          <span className="text-white">Maps</span>
          <span className="text-gray-400"> Directory</span>
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or location..."
                className="w-full bg-gray-700 text-gray-100 px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
              onClick={() => setShowAll(!showAll)}
            >
              SHOW ALL
            </button>
          </div>

          <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                className={`pb-2 px-1 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {error ? (
            <p className="text-red-400 mb-4">{error}</p>
          ) : (
            <p className="text-gray-400 mb-4">
              Showing {filteredData.length} results
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Hours</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-3">{item.Name}</td>
                    <td className="py-3">{item.Phone}</td>
                    <td className="py-3">{item.Hours}</td>
                    <td className="py-3">{item.Rating?.toFixed(1) || 'N/A'}</td>
                    <td className="py-3">{item.Address}</td>
                    <td className="py-3">
                      {item.URL && (
                        <a
                          href={item.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Map
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsDirectory;