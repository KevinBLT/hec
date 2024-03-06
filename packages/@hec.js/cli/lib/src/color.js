export function hexToColor(hexString = '#ffffff') {
  const num = parseInt(hexString.substring(1), 16);

  return {
    r: (num >>> 16) & 0xFF,
    g: (num >>> 8)  & 0xFF,
    b: (num)        & 0xFF
  };
}