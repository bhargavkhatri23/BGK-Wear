const str = "test".repeat(2000000);
try {
  // localStorage is not in Node.js, we can just simulate the error handling logic
  console.log('simulated');
} catch (e) {
  console.log(e);
}
