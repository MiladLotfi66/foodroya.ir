"use client";

import React from 'react';
import PropTypes from 'prop-types';

function Breadcrumb({ path, onBreadcrumbClick }) {
  return (
    <nav className="bg-gray-100 dark:bg-zinc-800 p-2 md:p-4 rounded-md mb-2 md:mb-4 text-xs md:text-base">
      <ol className="list-none flex flex-wrap text-grey-dark">
        {path?.map((crumb, index) => (
          <li
            key={`${crumb.id}-${index}`}
            className="flex items-center mb-1 md:mb-0"
          >
            <button
              onClick={() => onBreadcrumbClick(index)}
              className="text-blue-600 dark:text-teal-400 hover:underline focus:outline-none break-words"
            >
              {crumb.title}
            </button>
            {index < path.length - 1 && (
              <span className="mx-2">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

Breadcrumb.propTypes = {
  path: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
};

export default Breadcrumb;
