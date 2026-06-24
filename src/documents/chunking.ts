export function chunkText(
  text: string,
  chunkSize: number,
  overlap: number,
): string[] {
  if (overlap >= chunkSize) {
    throw new Error('Overlap must be less than chunk size');
  }
  if (text === '') {
    return [];
  }

  const result: string[] = [];
  let index = 0;

  while (index < text.length) {
    const chunk = text.slice(index, index + chunkSize);
    result.push(chunk);
    index += chunkSize - overlap;
  }
  return result;
}
