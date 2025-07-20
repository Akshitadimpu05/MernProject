import { auth } from '../auth/auth';

// Submit a solution for a contest problem
export const submitContestSolution = async (contestId, problemId, code, language) => {
  try {
    const response = await fetch(`/api/contests/${contestId}/problems/${problemId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify({ code, language })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit solution');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting contest solution:', error);
    throw error;
  }
};

// Run code for a contest problem without submitting
export const runContestCode = async (contestId, problemId, code, language, input) => {
  try {
    const response = await fetch(`/api/contests/${contestId}/problems/${problemId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify({ code, language, input })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to run code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error running contest code:', error);
    throw error;
  }
};

// Get submission status
export const getSubmissionStatus = async (submissionId) => {
  try {
    const response = await fetch(`/api/contests/submissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${auth.getToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get submission status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting submission status:', error);
    throw error;
  }
};

// Get all submissions for a contest (admin only)
export const getContestSubmissions = async (contestId) => {
  try {
    const response = await fetch(`/api/contests/${contestId}/submissions`, {
      headers: {
        Authorization: `Bearer ${auth.getToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get contest submissions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting contest submissions:', error);
    throw error;
  }
};

// Get user's submissions for a contest
export const getUserContestSubmissions = async (contestId) => {
  try {
    const response = await fetch(`/api/contests/${contestId}/mysubmissions`, {
      headers: {
        Authorization: `Bearer ${auth.getToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user contest submissions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user contest submissions:', error);
    throw error;
  }
};
