// A quick script to simulate the AppContext merge logic
const prev = [
  { id: '1', title: 'Test', reviews: [{ id: 'r1' }] } // user added review
];
const cloud = [
  { id: '1', title: 'Test', reviews: [] } // cloud has old data
];

const uniqueMap = new Map();
prev.forEach(p => uniqueMap.set(p.id, p));

cloud.forEach(p => {
  const existingLocal = uniqueMap.get(p.id);
  if (existingLocal) {
    const localReviewsCount = existingLocal.reviews?.length || 0;
    const cloudReviewsCount = p.reviews?.length || 0;
    if (localReviewsCount > cloudReviewsCount) {
      p.reviews = existingLocal.reviews;
      p.reviewsCount = existingLocal.reviewsCount;
      p.rating = existingLocal.rating;
    }
  }
  uniqueMap.set(p.id, p);
});

console.log(Array.from(uniqueMap.values())[0].reviews);
