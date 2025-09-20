import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Percent, Users, TrendingUp } from 'lucide-react';
import { FilteredCollege, UserPreferences } from '@/types/college';

interface CollegeResultsProps {
  colleges: FilteredCollege[];
  preferences: UserPreferences;
  onBack: () => void;
  onViewDetails: (college: FilteredCollege) => void;
}

export const CollegeResults = ({ colleges, preferences, onBack, onViewDetails }: CollegeResultsProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const displayedColleges = showAll ? colleges : colleges.slice(0, 10);
  const recommendedColleges = colleges.filter(c => c.isRecommended);

  if (colleges.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-4xl">😔</div>
              <h3 className="text-lg font-semibold">No Colleges Found</h3>
              <p className="text-muted-foreground">
                No colleges match your criteria. Try adjusting your preferences or percentile.
              </p>
              <Button onClick={onBack} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">College Recommendations</h1>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">
              <Percent className="mr-1 h-3 w-3" />
              {preferences.percentile}% Percentile
            </Badge>
            <Badge variant="secondary">
              <Users className="mr-1 h-3 w-3" />
              {preferences.seatType}
            </Badge>
            <Badge variant="secondary">
              {preferences.branch}
            </Badge>
            {preferences.collegeType && (
              <Badge variant="secondary">{preferences.collegeType}</Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{colleges.length}</p>
                  <p className="text-muted-foreground">Total Matches</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-success">{recommendedColleges.length}</p>
                  <p className="text-muted-foreground">Recommended</p>
                </div>
                <Star className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{colleges.length > 0 ? colleges[0].min.toFixed(1) : 0}%</p>
                  <p className="text-muted-foreground">Best Cutoff</p>
                </div>
                <Percent className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Colleges Alert */}
        {recommendedColleges.length > 0 && (
          <Card className="border-success/50 bg-success/5 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-success">
                <Star className="mr-2 h-5 w-5" />
                Highly Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {recommendedColleges.length} colleges are perfect matches for your percentile. 
                These have cutoffs very close to your score.
              </p>
            </CardContent>
          </Card>
        )}

        {/* College List */}
        <div className="space-y-4">
          {displayedColleges.map((college, index) => (
            <Card 
              key={`${college.college_name}-${college.seat_type}-${college.branch}`}
              className={`shadow-card hover:shadow-card-hover transition-all duration-300 ${
                college.isRecommended ? 'ring-2 ring-success/50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-tight mb-2">
                          {college.college_name}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{college.branch}</Badge>
                          <Badge variant="secondary">{college.seat_type}</Badge>
                          {college.isRecommended && (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              <Star className="mr-1 h-3 w-3" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {college.min.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min Cutoff
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Max Cutoff:</span>
                        <div className="font-medium">{college.max.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Average:</span>
                        <div className="font-medium">{college.mean.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Admissions:</span>
                        <div className="font-medium">{college.count} seats</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fit Score:</span>
                        <div className="font-medium">{college.fitScore.toFixed(0)}/100</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {college.college_name.includes('Mumbai') ? 'Mumbai' : 
                     college.college_name.includes('Pune') ? 'Pune' : 'Maharashtra'}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(college)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        {colleges.length > 10 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${colleges.length} Colleges`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};