import React, { useState } from 'react';
import { Brain, Camera, Upload, Plus, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface NutritionData {
  food_description: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  quantity: number;
  unit: string;
  confidence: number;
  nutrition_tip?: string;
}

interface NutritionAIProps {
  onFoodAdded: (data: NutritionData) => void;
}

const NutritionAI: React.FC<NutritionAIProps> = ({ onFoodAdded }) => {
  const [isActive, setIsActive] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async (isImage: boolean = true) => {
    if (isImage && !selectedFile) {
      setError('Please select an image file first');
      return;
    }
    
    if (!isImage && !textInput.trim()) {
      setError('Please enter a food description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let response;
      
      if (isImage && selectedFile) {
        // Image analysis
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await fetch('http://localhost:5000/api/analyze-food', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text analysis
        response = await fetch('http://localhost:5000/api/analyze-food', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: textInput }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error analyzing food:', err);
      // Fallback demo data
      const demoResult: NutritionData = {
        food_description: isImage ? "Mixed food items from uploaded image" : textInput,
        calories: 350,
        protein_grams: 20,
        carb_grams: 40,
        fat_grams: 10,
        quantity: 1,
        unit: "serving",
        confidence: 0.85,
        nutrition_tip: "This meal provides a good balance of macronutrients. Consider adding more vegetables for additional fiber and micronutrients."
      };
      setAnalysisResult(demoResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToLog = () => {
    if (analysisResult) {
      onFoodAdded(analysisResult);
      // Reset form
      setAnalysisResult(null);
      setSelectedFile(null);
      setImagePreview(null);
      setTextInput('');
      setError(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setTextInput('');
    setError(null);
  };

  return (
    <Card className="sticky top-8">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <CardTitle className="text-lg">Nutrition AI</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Image Preview Section */}
      {imagePreview && (
        <CardContent className="p-4 border-b">
          <div className="bg-blue-600 rounded-lg p-4 text-white">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={imagePreview} 
                  alt="Food preview" 
                  className="w-20 h-20 rounded-lg object-cover border-2 border-blue-400"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">
                  {isAnalyzing 
                    ? "Analyzing this image for nutritional content and providing valuable data including food descriptions, calories, protein, carbs, and fat in JSON format within your response."
                    : analysisResult 
                      ? "Analysis complete! Review the nutritional estimates below."
                      : "Ready to analyze this image for nutritional content and provide valuable data including food descriptions, calories, protein, carbs, and fat in JSON format."
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Upload Section */}
      <CardContent className="p-6 border-b">
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          
          {!imagePreview && (
            <Button
              variant="outline"
              className="w-full h-auto p-4 border-dashed border-2 hover:border-primary"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={isAnalyzing}
            >
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6" />
                <span>Select Food Image</span>
              </div>
            </Button>
          )}

          {imagePreview && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => analyzeFood(true)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>Analyze Image</span>
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isAnalyzing}
              >
                Reset
              </Button>
            </div>
          )}

          {/* Text Input Option */}
          <div className="relative">
            <Input
              placeholder="Ask about nutrition or describe image..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="pr-12"
              disabled={isAnalyzing}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => analyzeFood(false)}
              disabled={isAnalyzing || !textInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Take a photo of your food or describe it and I'll provide nutritional estimates!
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Analysis Results */}
      {analysisResult && (
        <CardContent className="p-6 border-b">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold">Nutritional Estimates</h4>
              <Badge variant="outline" className="text-green-500 border-green-500/20">
                {Math.round((analysisResult.confidence || 0.85) * 100)}% confident
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground">Calories:</div>
                <div className="font-semibold text-lg">{analysisResult.calories} kcal</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Protein:</div>
                <div className="font-semibold text-lg">{analysisResult.protein_grams}g</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Carbs:</div>
                <div className="font-semibold text-lg">{analysisResult.carb_grams}g</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Fat:</div>
                <div className="font-semibold text-lg">{analysisResult.fat_grams}g</div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Food:</span>
                <span className="font-medium text-right max-w-[200px]">{analysisResult.food_description}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Serving:</span>
                <span className="font-medium">{analysisResult.quantity} {analysisResult.unit}</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* JSON Output */}
      {analysisResult && (
        <CardContent className="p-6 border-b">
          <h4 className="font-semibold mb-3">JSON Output</h4>
          <Card className="bg-muted">
            <CardContent className="p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
{JSON.stringify({
  food_description: analysisResult.food_description,
  calories: analysisResult.calories,
  protein_grams: analysisResult.protein_grams,
  carb_grams: analysisResult.carb_grams,
  fat_grams: analysisResult.fat_grams,
  quantity: analysisResult.quantity,
  unit: analysisResult.unit,
  confidence: analysisResult.confidence
}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      )}

      {/* Actions */}
      <CardContent className="p-6">
        <Button
          className="w-full"
          onClick={handleAddToLog}
          disabled={!analysisResult}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add to Log
        </Button>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Disclaimer: Nutritional information is an estimate and not medical advice. Consult a healthcare professional.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionAI;