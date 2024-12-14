export const taskColors = [
  '#1EAEDB', // Bright Blue
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
];

let currentColorIndex = 0;

export const getNextColor = () => {
  const color = taskColors[currentColorIndex];
  currentColorIndex = (currentColorIndex + 1) % taskColors.length;
  return color;
};