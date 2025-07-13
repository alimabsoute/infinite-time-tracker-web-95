
import { differenceInDays } from 'date-fns';

export const calculateBubblePosition = (
  createdAt: Date,
  startDate: Date,
  endDate: Date
): [number, number, number] => {
  const totalDays = differenceInDays(endDate, startDate) || 1;
  const daysFromStart = differenceInDays(createdAt, startDate);
  const xPosition = Math.max(-8, Math.min(8, (daysFromStart / totalDays) * 16 - 8));
  const yPosition = Math.random() * 6 - 3;
  const zPosition = Math.random() * 4 - 2;
  
  return [xPosition, yPosition, zPosition];
};

export const calculateBubbleSize = (totalTime: number): number => {
  const timeInHours = Math.max(0, totalTime / 3600000);
  return Math.max(0.3, Math.min(2, Math.log(timeInHours + 1) * 0.8));
};
