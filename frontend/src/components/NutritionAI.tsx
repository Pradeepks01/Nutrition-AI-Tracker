import React, { useState } from 'react';
import { Brain, Camera, Upload, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { apiService, NutritionData } from '../services/api';

const NutritionAI: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await apiService.analyzeFood(selectedFile);
      setAnalysisResult(result);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToLog = async () => {
    if (!analysisResult) return;

    try {
      await apiService.addFood({
        name: analysisResult.food_description,
        calories: analysisResult.calories,
        protein: analysisResult.protein_grams,
        carbs: analysisResult.carb_grams,
        fat: analysisResult.fat_grams,
      });
      
      // Reset form after successful addition
      setAnalysisResult(null);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add food to log');
    }
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
          <Button
            variant="outline"
            className="w-full h-auto p-4 border-dashed border-2 hover:border-primary"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={isAnalyzing}
          >
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6" />
              <span>
                {selectedFile ? selectedFile.name : 'Select Food Image'}
              </span>
            </div>
          </Button>

          {selectedFile && (
            <Button
              className="w-full"
              onClick={handleImageUpload}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5" />
                  <span>Analyze with AI</span>
                </div>
              )}
            </Button>
          )}

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
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-semibold">Nutritional Estimates</h4>
            {analysisResult.confidence && (
              <Badge variant="outline" className="text-green-500 border-green-500/20">
                {Math.round(analysisResult.confidence * 100)}% confident
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Food:</span>
              <span className="font-medium text-right max-w-[200px]">{analysisResult.food_description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calories:</span>
              <span className="font-medium">{analysisResult.calories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Protein:</span>
              <span className="font-medium">{analysisResult.protein_grams}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carbs:</span>
              <span className="font-medium">{analysisResult.carb_grams}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fat:</span>
              <span className="font-medium">{analysisResult.fat_grams}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serving:</span>
              <span className="font-medium">{analysisResult.quantity} {analysisResult.unit}</span>
            </div>
          </div>
        </CardContent>
      )}

      {/* JSON Output */}
      {analysisResult && (
        <CardContent className="p-6 border-b">
          <h4 className="font-semibold mb-4">JSON Output</h4>
          <Card className="bg-muted">
            <CardContent className="p-4 text-sm font-mono">
              <pre className="whitespace-pre-wrap text-xs">
{JSON.stringify(analysisResult, null, 2)}
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
          disabled={!analysisResult || !!analysisResult.error}
        >
          <Plus className="w-5 h-5" />
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