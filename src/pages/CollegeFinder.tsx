import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { UserInputForm } from '@/components/UserInputForm';
import { CollegeResults } from '@/components/CollegeResults';
import { CollegeDetails } from '@/components/CollegeDetails';
import { parseCSV, filterColleges } from '@/utils/collegeFilter';
import { College, UserPreferences, FilteredCollege } from '@/types/college';
import { useToast } from '@/hooks/use-toast';

type Screen = 'welcome' | 'input' | 'results' | 'details';

export const CollegeFinder = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<FilteredCollege[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<FilteredCollege | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCollegeData();
  }, []);

  const loadCollegeData = async () => {
    try {
      const response = await fetch('/data/colleges.csv');
      const csvText = await response.text();
      const parsedColleges = parseCSV(csvText);
      setColleges(parsedColleges);
      setLoading(false);
    } catch (error) {
      console.error('Error loading college data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load college data. Please refresh the page.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleStart = () => {
    setCurrentScreen('input');
  };

  const handleFormSubmit = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    const filtered = filterColleges(colleges, preferences);
    setFilteredColleges(filtered);
    setCurrentScreen('results');
    
    toast({
      title: 'Search Complete',
      description: `Found ${filtered.length} colleges matching your criteria.`,
    });
  };

  const handleViewDetails = (college: FilteredCollege) => {
    setSelectedCollege(college);
    setCurrentScreen('details');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setUserPreferences(null);
    setFilteredColleges([]);
    setSelectedCollege(null);
  };

  const handleBackToInput = () => {
    setCurrentScreen('input');
  };

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading college data...</p>
        </div>
      </div>
    );
  }

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen onStart={handleStart} />;
    
    case 'input':
      return (
        <UserInputForm 
          onSubmit={handleFormSubmit}
          onBack={handleBackToWelcome}
          colleges={colleges}
        />
      );
    
    case 'results':
      return (
        <CollegeResults 
          colleges={filteredColleges}
          preferences={userPreferences!}
          onBack={handleBackToInput}
          onViewDetails={handleViewDetails}
        />
      );
    
    case 'details':
      return (
        <CollegeDetails 
          college={selectedCollege!}
          onBack={handleBackToResults}
        />
      );
    
    default:
      return <WelcomeScreen onStart={handleStart} />;
  }
};