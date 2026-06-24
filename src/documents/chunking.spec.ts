import { chunkText } from './chunking';

describe('chunkText', () => {
  it('should chunk text correctly', () => {
    const text = 'This is a test of the chunking function.';
    const chunkSize = 10;
    const overlap = 2;
    const expected = [
      'This is a ',
      'a test of ',
      'f the chun',
      'unking fun',
      'unction.',
    ];
    expect(chunkText(text, chunkSize, overlap)).toEqual(expected);
  });

  it('should throw an error if overlap is greater than or equal to chunk size', () => {
    expect(() => chunkText('test', 5, 5)).toThrow(
      'Overlap must be less than chunk size',
    );
  });

  it('should return an empty array for empty text', () => {
    expect(chunkText('', 5, 2)).toEqual([]);
  });
});
