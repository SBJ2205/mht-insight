import { College, UserPreferences, FilteredCollege } from '@/types/college';

export const parseCSV = (csvText: string): College[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, ''));
    const college: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (['sum', 'count', 'max', 'min', 'mean', 'max-min', 'max-mean'].includes(header)) {
        college[header] = parseFloat(value) || 0;
      } else {
        college[header] = value;
      }
    });
    
    return college as College;
  });
};

export const filterColleges = (
  colleges: College[], 
  preferences: UserPreferences
): FilteredCollege[] => {
  return colleges
    .filter(college => {
      // Filter by percentile (user percentile should be >= min cutoff)
      if (preferences.percentile < college.min) return false;
      
      // Filter by seat type
      if (preferences.seatType !== 'ALL' && college.seat_type !== preferences.seatType) return false;
      
      // Filter by branch
      if (preferences.branch !== 'ALL' && college.branch !== preferences.branch) return false;
      
      // Filter by college type (if specified)
      if (preferences.collegeType && preferences.collegeType !== 'ALL') {
        const isGovernment = preferences.collegeType === 'GOVERNMENT';
        const collegeNameLower = college.college_name.toLowerCase();
        const isGovCollege = collegeNameLower.includes('government') || 
                           collegeNameLower.includes('coep') ||
                           collegeNameLower.includes('vjti') ||
                           collegeNameLower.includes('institute of technology');
        
        if (isGovernment !== isGovCollege) return false;
      }
      
      return true;
    })
    .map(college => {
      // Calculate fit score (higher is better)
      const percentileDiff = preferences.percentile - college.min;
      const fitScore = Math.max(0, 100 - percentileDiff);
      const isRecommended = percentileDiff <= 5 && percentileDiff >= 0;
      
      return {
        ...college,
        fitScore,
        isRecommended
      };
    })
    .sort((a, b) => {
      // Sort by fit score first, then by min percentile
      if (a.fitScore !== b.fitScore) return b.fitScore - a.fitScore;
      return b.min - a.min;
    });
};

export const getSeatTypes = (colleges: College[]): string[] => {
  const seatTypes = [...new Set(colleges.map(c => c.seat_type))];
  return ['ALL', ...seatTypes.sort()];
};

export const getBranches = (colleges: College[]): string[] => {
  const branches = [...new Set(colleges.map(c => c.branch))];
  return ['ALL', ...branches.sort()];
};

export const getCollegeTypes = (): string[] => {
  return ['ALL', 'GOVERNMENT', 'PRIVATE'];
};