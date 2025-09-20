import { College, UserPreferences, FilteredCollege } from '@/types/college';

export const parseCSV = (csvText: string): College[] => {
  const lines = csvText.trim().split('\n');
  
  // Proper CSV parsing that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };
  
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line);
      const college: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || ''; // Ensure we have a value
        if (['sum', 'count', 'max', 'min', 'mean', 'max-min', 'max-mean'].includes(header)) {
          college[header] = parseFloat(value) || 0;
        } else {
          college[header] = value;
        }
      });
      
      return college as College;
    })
    .filter(college => 
      // Filter out rows with missing essential data
      college.college_name && 
      college.seat_type && 
      college.branch && 
      college.score_type
    );
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

const getSeatTypeFullForm = (type: string): string => {
  const fullForms: { [key: string]: string } = {
    'GOPENS': 'GOPENS (General Open)',
    'SC': 'SC (Scheduled Caste)',
    'ST': 'ST (Scheduled Tribe)', 
    'OBC': 'OBC (Other Backward Class)',
    'EWS': 'EWS (Economically Weaker Section)',
    'TFWS': 'TFWS (Tuition Fee Waiver Scheme)',
    'NT1': 'NT1 (Nomadic Tribe 1)',
    'NT2': 'NT2 (Nomadic Tribe 2)',
    'NT3': 'NT3 (Nomadic Tribe 3)',
    'SBC': 'SBC (Special Backward Class)',
    'VJ': 'VJ (Vimukta Jati)',
    'SEBC': 'SEBC (Socially and Educationally Backward Class)'
  };
  return fullForms[type] || type;
};

export const getSeatTypes = (colleges: College[]): string[] => {
  const seatTypes = [...new Set(colleges.map(c => c.seat_type))]
    .filter(type => type && type.trim() !== '') // Filter out empty values
    .sort()
    .map(type => getSeatTypeFullForm(type));
  return ['ALL', ...seatTypes];
};

export const getBranches = (colleges: College[]): string[] => {
  const branches = [...new Set(colleges.map(c => c.branch))]
    .filter(branch => branch && branch.trim() !== '') // Filter out empty values
    .sort();
  return ['ALL', ...branches];
};

export const getCollegeTypes = (): string[] => {
  return ['ALL', 'GOVERNMENT', 'PRIVATE'];
};