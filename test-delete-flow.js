const cloudProducts = [
  { id: '1', title: 'Product 1', reviews: [] },
  { id: '2', title: 'Product 2', reviews: [] }
];

let state = [
  { id: '1', title: 'Product 1', reviews: [{ id: 'rev1' }] }, // locally added review
  { id: '2', title: 'Product 2', reviews: [] }
];

const deletedProductIds = ['2']; // User deleted product 2

const uniqueMap = new Map();
state.forEach(p => {
  if (!deletedProductIds.includes(p.id)) {
    uniqueMap.set(p.id, p);
  }
});

cloudProducts.forEach(p => {
  if (!deletedProductIds.includes(p.id)) {
    const existingLocal = uniqueMap.get(p.id);
    if (existingLocal) {
      const localReviewsCount = existingLocal.reviews?.length || 0;
      const cloudReviewsCount = p.reviews?.length || 0;
      if (localReviewsCount > cloudReviewsCount) {
        p.reviews = existingLocal.reviews;
      }
    }
    uniqueMap.set(p.id, p);
  }
});

console.log(Array.from(uniqueMap.values())[0].reviews);
