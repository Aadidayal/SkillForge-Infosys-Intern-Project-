// Generate a simple placeholder image as data URI
export const generatePlaceholder = (width = 300, height = 200, text = 'Course') => {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Common placeholder images
export const placeholders = {
  course: generatePlaceholder(300, 200, 'Course'),
  reactCourse: generatePlaceholder(300, 200, 'React Course'),
  javascriptCourse: generatePlaceholder(300, 200, 'JavaScript Course'),
  databaseCourse: generatePlaceholder(300, 200, 'Database Course'),
  nodejsCourse: generatePlaceholder(300, 200, 'NodeJS Course'),
  cssCourse: generatePlaceholder(300, 200, 'CSS Course'),
};