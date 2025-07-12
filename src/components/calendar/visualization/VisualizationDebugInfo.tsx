
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Bug } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface VisualizationDebugInfoProps {
  currentMode: string;
  has3DSupport: boolean;
  dataValidation?: any;
  fallbackHistory?: string[];
}

const VisualizationDebugInfo: React.FC<VisualizationDebugInfoProps> = ({
  currentMode,
  has3DSupport,
  dataValidation,
  fallbackHistory = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide debug info in production
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full mt-4 flex items-center gap-2">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Bug size={14} />
          Debug Information
          {fallbackHistory.length > 0 && (
            <Badge variant="outline" className="ml-auto">
              {fallbackHistory.length} fallbacks
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1">System Status</div>
              <div>Current Mode: <Badge variant="outline">{currentMode}</Badge></div>
              <div>WebGL Support: <Badge variant={has3DSupport ? "default" : "destructive"}>
                {has3DSupport ? 'Yes' : 'No'}
              </Badge></div>
            </div>
            
            <div>
              <div className="font-semibold mb-1">Data Status</div>
              {dataValidation ? (
                <>
                  <div>Valid Data: <Badge variant={dataValidation.hasValidData ? "default" : "destructive"}>
                    {dataValidation.hasValidData ? 'Yes' : 'No'}
                  </Badge></div>
                  <div>Sessions: {dataValidation.validSessionsCount}</div>
                  <div>Timer Groups: {dataValidation.timerGroupsCount}</div>
                </>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
          
          {fallbackHistory.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Fallback History</div>
              <div className="flex gap-1 flex-wrap">
                {fallbackHistory.map((mode, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {mode} failed
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {dataValidation?.errors && dataValidation.errors.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Validation Errors</div>
              <div className="space-y-1">
                {dataValidation.errors.map((error: string, index: number) => (
                  <div key={index} className="text-red-600 text-xs">• {error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VisualizationDebugInfo;
