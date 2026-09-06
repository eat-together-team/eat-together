// Reverses the " - " join OrganizeFlow.js uses to flatten a step 2
// {name, address} location into the plain string `event.location` is
// stored as in Firestore. Shared by anywhere that needs to display a
// stored event's location as two lines (name, then address) instead of
// the single flattened string.
const parseLocation = (locationString) => {
  if (!locationString) return null;
  const separatorIndex = locationString.indexOf(" - ");
  if (separatorIndex === -1) return { name: locationString, address: "" };
  return { name: locationString.slice(0, separatorIndex), address: locationString.slice(separatorIndex + 3) };
};

export default parseLocation;
