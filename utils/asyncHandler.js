// asyncHandler function to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
    // Execute the function and catch any errors that occur
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  export default asyncHandler;
  