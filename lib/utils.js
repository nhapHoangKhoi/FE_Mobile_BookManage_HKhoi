// convert createdAt to format "Aug 2023"
export function formatMemberSince(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

// convert createdAt to format "August 15, 2023"
export function formatPublishDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// use to delay something
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));