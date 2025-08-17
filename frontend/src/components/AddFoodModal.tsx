import React, { useState } from 'react';
import { Search, Camera, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { apiService, FoodItem } from '../services/api';

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualFood, setManualFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving: ''
  });

  React.useEffect(() => {
    if (open) {
      // Load initial food database when modal opens
      handleSearch('');
    }
  }, [open]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await apiService.searchFoodDatabase(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleAddFood = async (food: FoodItem) => {
    try {
      await apiService.addFood(food);
      // Show success message or update UI
      onClose();
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const handleManualAdd = async () => {
    try {
      const foodData = {
        name: manualFood.name,
        calories: parseInt(manualFood.calories) || 0,
        protein: parseFloat(manualFood.protein) || 0,
        carbs: parseFloat(manualFood.carbs) || 0,
        fat: parseFloat(manualFood.fat) || 0,
      };
      
      await apiService.addFood(foodData);
      // Show success message or update UI
      
      // Reset form
      setManualFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        serving: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to add manual food:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}

              <div className="space-y-2">
                {!isSearching && searchResults.map((food) => (
                  <Card
                    key={food.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium mb-2">{food.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-500 border-green-500/20">
                              P{food.protein}g
                            </Badge>
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                              C{food.carbs}g
                            </Badge>
                            <Badge variant="outline" className="text-purple-500 border-purple-500/20">
                              F{food.fat}g
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary mb-2">
                            {food.calories} kcal
                          </div>
                          <Button size="sm" onClick={() => handleAddFood(food)}>
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="camera">
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Food Recognition</h3>
              <p className="text-muted-foreground mb-6">
                Take a photo of your food and our AI will analyze it automatically
              </p>
              <Button>
                Open Camera
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Food Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter food name"
                  value={manualFood.name}
                  onChange={(e) => setManualFood({...manualFood, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Calories
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manualFood.calories}
                    onChange={(e) => setManualFood({...manualFood, calories: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Serving Size
                  </label>
                  <Input
                    type="text"
                    placeholder="1 cup"
                    value={manualFood.serving}
                    onChange={(e) => setManualFood({...manualFood, serving: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manualFood.protein}
                    onChange={(e) => setManualFood({...manualFood, protein: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manualFood.carbs}
                    onChange={(e) => setManualFood({...manualFood, carbs: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fat (g)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manualFood.fat}
                    onChange={(e) => setManualFood({...manualFood, fat: e.target.value})}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleManualAdd} disabled={!manualFood.name}>
                Add Food
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFoodModal;