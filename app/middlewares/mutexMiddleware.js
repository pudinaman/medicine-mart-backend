const { Mutex } = require('async-mutex');

// Create a new mutex instance
const mutex = new Mutex();

// Define your middleware function
const mutexMiddleware = () => {
  return async (req, res, next) => {
    // Acquire the mutex lock
    const release = await mutex.acquire();
    
    try {
      // Your critical section of code goes here
      // For example, you can perform database operations, file system access, etc.
      console.log('Mutex lock acquired');
      
      // Call the next middleware or route handler
      next();
    } catch (error) {
      // Handle errors if needed
      console.error('Error in mutexMiddleware:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      // Release the mutex lock when done
      release();
      console.log('Mutex lock released');
    }
  };
};

module.exports = mutexMiddleware;