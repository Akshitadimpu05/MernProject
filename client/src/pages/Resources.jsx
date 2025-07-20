import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Resources() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const navigate = useNavigate();

  // Redirect to premium page if not authenticated or not premium
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user?.isPremium) {
      navigate('/premium');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#FF4081] to-[#F06292] p-8 rounded-t-lg text-white">
          <h1 className="text-3xl font-bold mb-2">Premium Resources</h1>
          <p className="text-lg opacity-90">Exclusive learning materials to boost your coding skills</p>
        </div>
        
        <div className="bg-[#1E1E1E] p-8 rounded-b-lg shadow-lg">
          {/* Learning Paths Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#FF4081] mb-6 pb-2 border-b border-[#FF4081] border-opacity-30">
              Learning Paths
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Data Structures Path */}
              <div className="bg-[#121212] p-6 rounded-lg border border-[#FF4081] border-opacity-20 hover:border-opacity-50 transition-all">
                <h3 className="text-xl font-bold text-white mb-3">Data Structures Mastery</h3>
                <p className="text-[#B0B0B0] mb-4">Master fundamental and advanced data structures with our curated learning path.</p>
                <ul className="space-y-2 text-[#FFFFFF] mb-4">
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Arrays, Linked Lists, Stacks & Queues
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Trees, Graphs & Hash Tables
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Advanced: Segment Trees, Tries
                  </li>
                </ul>
                <a href="#" className="text-[#FF4081] hover:text-[#F06292] font-medium flex items-center">
                  Start learning
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Algorithms Path */}
              <div className="bg-[#121212] p-6 rounded-lg border border-[#FF4081] border-opacity-20 hover:border-opacity-50 transition-all">
                <h3 className="text-xl font-bold text-white mb-3">Algorithm Techniques</h3>
                <p className="text-[#B0B0B0] mb-4">Learn essential algorithmic approaches to solve complex problems efficiently.</p>
                <ul className="space-y-2 text-[#FFFFFF] mb-4">
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Sorting & Searching Algorithms
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Dynamic Programming & Greedy
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Graph Algorithms & Optimization
                  </li>
                </ul>
                <a href="#" className="text-[#FF4081] hover:text-[#F06292] font-medium flex items-center">
                  Start learning
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Interview Prep Path */}
              <div className="bg-[#121212] p-6 rounded-lg border border-[#FF4081] border-opacity-20 hover:border-opacity-50 transition-all">
                <h3 className="text-xl font-bold text-white mb-3">Interview Preparation</h3>
                <p className="text-[#B0B0B0] mb-4">Comprehensive guide to ace technical interviews at top tech companies.</p>
                <ul className="space-y-2 text-[#FFFFFF] mb-4">
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Problem-solving strategies
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    System design fundamentals
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FF80AB] mr-2">•</span>
                    Behavioral interview techniques
                  </li>
                </ul>
                <a href="#" className="text-[#FF4081] hover:text-[#F06292] font-medium flex items-center">
                  Start learning
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
          
          {/* Coding Tips & Tricks Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#FF4081] mb-6 pb-2 border-b border-[#FF4081] border-opacity-30">
              Coding Tips & Tricks
            </h2>
            
            <div className="space-y-6">
              <div className="bg-[#121212] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-3">Optimizing Time Complexity</h3>
                <p className="text-[#B0B0B0] mb-4">
                  Understanding time complexity is crucial for writing efficient code. Here are some key techniques to optimize your algorithms:
                </p>
                <div className="bg-[#1A1A1A] p-4 rounded-md mb-4 overflow-x-auto">
                  <pre className="text-[#FFFFFF] text-sm">
                    <code>
{`// Instead of nested loops (O(n²))
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    // O(n²) operation
  }
}

// Use a hashmap for O(1) lookups
const map = new Map();
for (let i = 0; i < n; i++) {
  map.set(array[i], i);
}
// Now lookups are O(1) instead of O(n)`}
                    </code>
                  </pre>
                </div>
                <ul className="space-y-2 text-[#FFFFFF]">
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Use appropriate data structures (hash tables for lookups, heaps for priority queues)
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Avoid unnecessary nested loops when possible
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Consider divide and conquer or dynamic programming approaches
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#121212] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-3">Memory Management Techniques</h3>
                <p className="text-[#B0B0B0] mb-4">
                  Efficient memory usage is as important as time complexity. Here are some best practices:
                </p>
                <ul className="space-y-2 text-[#FFFFFF] mb-4">
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Use in-place algorithms when possible to avoid extra memory allocation
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Be mindful of call stack usage in recursive functions
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF50] mr-2">✓</span>
                    Release resources properly in languages without garbage collection
                  </li>
                </ul>
                <div className="bg-[#1A1A1A] p-4 rounded-md overflow-x-auto">
                  <pre className="text-[#FFFFFF] text-sm">
                    <code>
{`// In-place array reversal (O(1) space)
function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    // Swap elements
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  
  return arr;
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
          
          {/* Documentation & Resources Section */}
          <section>
            <h2 className="text-2xl font-bold text-[#FF4081] mb-6 pb-2 border-b border-[#FF4081] border-opacity-30">
              Documentation & External Resources
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#121212] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Language Documentation</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      JavaScript (MDN Web Docs)
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.python.org/3/" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Python Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.oracle.com/en/java/" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Java Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://devdocs.io/cpp/" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      C++ Reference
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#121212] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Learning Platforms</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="https://www.coursera.org/courses?query=algorithms" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Coursera - Algorithm Specializations
                    </a>
                  </li>
                  <li>
                    <a href="https://www.edx.org/learn/computer-science" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      edX - Computer Science Courses
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/c/MITOpenCourseWare" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      MIT OpenCourseWare
                    </a>
                  </li>
                  <li>
                    <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer" className="text-[#FF4081] hover:text-[#F06292] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      GeeksforGeeks
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Resources;
