export function rowNumberToLetter(n) {
  if (n <= 0) return ''
  let result = ''
  let num = n
  while (num > 0) {
    const remainder = (num - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    num = Math.floor((num - 1) / 26)
  }
  return result || 'A'
}
