export function getCurrencyByCountry(countryName) {
  const currencyMap = {
    Morocco: "MAD",
    Algeria: "DZD",
    Tunisia: "TND",
    France: "EUR",
    Egypt: "EGP",
  };

  return currencyMap[countryName] || "TND";
}