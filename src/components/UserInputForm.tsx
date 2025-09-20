import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Search } from 'lucide-react';
import { UserPreferences } from '@/types/college';
import { getSeatTypes, getBranches, getCollegeTypes } from '@/utils/collegeFilter';
import type { College } from '@/types/college';

interface UserInputFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  onBack: () => void;
  colleges: College[];
}

export const UserInputForm = ({ onSubmit, onBack, colleges }: UserInputFormProps) => {
  const [percentile, setPercentile] = useState(85);
  const [seatType, setSeatType] = useState('');
  const [branch, setBranch] = useState('');
  const [collegeType, setCollegeType] = useState('ALL');
  const [location, setLocation] = useState('');
  const [maxFees, setMaxFees] = useState('');

  const seatTypes = getSeatTypes(colleges);
  const branches = getBranches(colleges);
  const collegeTypes = getCollegeTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seatType || !branch) {
      return;
    }

    const preferences: UserPreferences = {
      percentile,
      seatType,
      branch,
      collegeType: collegeType === 'ALL' ? undefined : collegeType,
      location: location || undefined,
      maxFees: maxFees ? parseInt(maxFees) : undefined,
    };

    onSubmit(preferences);
  };

  const isFormValid = seatType && branch;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Your Preferences</CardTitle>
            <p className="text-muted-foreground">
              Tell us about your profile to find matching colleges
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Exam Type - Fixed */}
              <div className="space-y-2">
                <Label htmlFor="exam-type">Exam Type</Label>
                <Input 
                  id="exam-type"
                  value="MHT CET"
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Percentile */}
              <div className="space-y-4">
                <Label>Percentile: {percentile}%</Label>
                <div className="px-3">
                  <Slider
                    value={[percentile]}
                    onValueChange={(value) => setPercentile(value[0])}
                    max={100}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Category / Seat Type */}
              <div className="space-y-2">
                <Label htmlFor="seat-type">Category / Seat Type *</Label>
                <Select value={seatType} onValueChange={setSeatType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent>
                    {seatTypes.filter(type => type !== 'ALL').map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch / Course */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch / Course Preference *</Label>
                <Select value={branch} onValueChange={setBranch} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.filter(b => b !== 'ALL').map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Filters */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Optional Filters</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* College Type */}
                  <div className="space-y-2">
                    <Label htmlFor="college-type">College Type</Label>
                    <Select value={collegeType} onValueChange={setCollegeType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {collegeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Preference</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Mumbai, Pune"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Max Fees */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="max-fees">Maximum Fees (Annual)</Label>
                  <Input
                    id="max-fees"
                    type="number"
                    placeholder="e.g., 200000"
                    value={maxFees}
                    onChange={(e) => setMaxFees(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  variant="hero"
                  disabled={!isFormValid}
                  className="flex-1"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Colleges
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};