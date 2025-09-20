import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Search, Target, TrendingUp } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            MHT CET College Finder
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Find MHT CET colleges you qualify for based on your percentile, category, and preferences
          </p>
          
          <Button 
            variant="hero" 
            size="lg" 
            onClick={onStart}
            className="text-lg px-8 py-6 h-auto"
          >
            <Search className="mr-2 h-5 w-5" />
            Find Colleges
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Precise Matching</h3>
              <p className="text-muted-foreground">
                Get colleges that match your exact percentile and category requirements
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                AI-powered suggestions based on cutoff trends and your profile
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <GraduationCap className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">Comprehensive Data</h3>
              <p className="text-muted-foreground">
                Access to complete MHT CET admission data across all rounds
              </p>
            </div>
          </Card>
        </div>

        <div className="text-sm text-muted-foreground mt-8">
          Data includes all CAP rounds • Updated for latest admissions
        </div>
      </div>
    </div>
  );
};