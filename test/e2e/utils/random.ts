export const random = (digits: number = 3): number => Number(Date.now().toString().slice(-digits));
