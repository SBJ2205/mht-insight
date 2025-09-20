import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, TrendingUp, Percent, Star } from 'lucide-react';
import { FilteredCollege } from '@/types/college';

interface CollegeDetailsProps {
  college: FilteredCollege;
  onBack: () => void;
}

export const CollegeDetails = ({ college, onBack }: CollegeDetailsProps) => {
  // Correct analysis calculations
  const percentileRange = Math.abs(college.max - college.min);
  const variability = percentileRange > 10 ? 'High' : percentileRange > 5 ? 'Medium' : 'Low';
  
  // More accurate probability calculations based on user percentile vs cutoffs
  const getAdmissionProbability = (userPercentile: number, cutoff: number) => {
    const diff = userPercentile - cutoff;
    if (diff >= 5) return 'Very High';
    if (diff >= 2) return 'High'; 
    if (diff >= 0) return 'Good';
    if (diff >= -2) return 'Moderate';
    return 'Low';
  };

  // Get user percentile from fitScore calculation (reverse engineering)
  const estimatedUserPercentile = college.min + (100 - college.fitScore);
  const minProbability = getAdmissionProbability(estimatedUserPercentile, college.min);
  const avgProbability = getAdmissionProbability(estimatedUserPercentile, college.mean);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
            {college.isRecommended && (
              <Badge variant="default" className="bg-success text-success-foreground">
                <Star className="mr-1 h-3 w-3" />
                Recommended for You
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {college.college_name}
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-base">
              {college.branch}
            </Badge>
            <Badge variant="secondary" className="text-base">
              {college.seat_type}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {college.min.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Min Cutoff</p>
                </div>
                <Percent className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {college.max.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Max Cutoff</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {college.mean.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Average</p>
                </div>
                <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold">Avg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {college.count}
                  </p>
                  <p className="text-muted-foreground">Total Seats</p>
                </div>
                <Users className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Cutoff Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Percentile Range:</span>
                <span className="font-medium">
                  {college.min.toFixed(1)}% - {college.max.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Range Span:</span>
                <span className="font-medium">
                  {percentileRange.toFixed(1)} percentile points
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Variability:</span>
                <Badge variant={variability === 'Low' ? 'default' : variability === 'Medium' ? 'secondary' : 'destructive'}>
                  {variability}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your Fit Score:</span>
                <span className="text-lg font-bold text-primary">
                  {college.fitScore.toFixed(0)}/100
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>College Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Location:</span>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span className="font-medium">
                    {college.college_name.includes('Mumbai') ? 'Mumbai' : 
                     college.college_name.includes('Pune') ? 'Pune' : 
                     'Maharashtra'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">
                  {college.college_name.toLowerCase().includes('government') || 
                   college.college_name.includes('COEP') ||
                   college.college_name.includes('VJTI') ? 'Government' : 'Private'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{college.branch}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Exam:</span>
                <span className="font-medium">{college.score_type}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admission Insights */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Admission Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {college.isRecommended && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center text-success mb-2">
                    <Star className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Highly Recommended</span>
                  </div>
                  <p className="text-sm">
                    This college is an excellent match for your percentile. Your score is very close to the typical cutoff range.
                  </p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Admission Probability</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Based on Min Cutoff:</span>
                      <span className={`font-medium ${
                        minProbability === 'Very High' || minProbability === 'High' ? 'text-success' : 
                        minProbability === 'Good' ? 'text-primary' : 
                        minProbability === 'Moderate' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {minProbability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Based on Average:</span>
                      <span className={`font-medium ${
                        avgProbability === 'Very High' || avgProbability === 'High' ? 'text-success' : 
                        avgProbability === 'Good' ? 'text-primary' : 
                        avgProbability === 'Moderate' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {avgProbability}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Competition Level</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Seats Available:</span>
                      <span className="font-medium">{college.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cutoff Stability:</span>
                      <span className="font-medium">
                        {variability === 'Low' ? 'Stable' : variability === 'Medium' ? 'Moderate' : 'Variable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};