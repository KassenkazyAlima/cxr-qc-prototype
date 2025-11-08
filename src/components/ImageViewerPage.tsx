import React, { useState, FormEvent } from "react";
import { RotateCw, Contrast, Sun, Maximize2, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ImageViewerPageProps {
  patientId: string;
  onGenerateReport: () => void;
}

export function ImageViewerPage({ patientId, onGenerateReport }: ImageViewerPageProps) {
  const [analyzed, setAnalyzed] = useState(false);

  const handleDetect = () => {
    setAnalyzed(true);
  };

  const analysisResults = [
    {
      metric: 'Rotation',
      value: 6,
      unit: '°',
      status: 'warning',
      icon: RotateCw,
      threshold: '< 5°',
    },
    {
      metric: 'Blur Detection',
      value: 92,
      unit: '%',
      status: 'pass',
      icon: Contrast,
      threshold: '> 85%',
    },
    {
      metric: 'Exposure',
      value: 88,
      unit: '%',
      status: 'pass',
      icon: Sun,
      threshold: '80-95%',
    },
    {
      metric: 'Coverage',
      value: 95,
      unit: '%',
      status: 'pass',
      icon: Maximize2,
      threshold: '> 90%',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">QC Image Viewer</h1>
          <p className="text-gray-600">Patient ID: {patientId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: X-ray Image */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">X-ray Image</h2>
            <div className="bg-gray-900 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1631651363531-fd29aec4cb5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzdCUyMHgtcmF5JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjIwMTIxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Chest X-ray"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                Zoom In
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Zoom Out
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Reset
              </Button>
            </div>
          </div>

          {/* Right: Analysis Results */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Analysis Results</h2>

            {!analyzed ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Contrast className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-6">Click "Detect" to analyze this X-ray</p>
                <Button onClick={handleDetect} className="bg-blue-600 hover:bg-blue-700">
                  Run QC Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {analysisResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <div
                      key={result.metric}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-gray-900">{result.metric}</p>
                            <p className="text-xs text-gray-500">
                              Threshold: {result.threshold}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl text-gray-900">
                          {result.value}
                          {result.unit}
                        </span>
                      </div>
                      <Progress
                        value={result.value}
                        className={
                          result.status === 'pass'
                            ? '[&>div]:bg-green-600'
                            : result.status === 'warning'
                            ? '[&>div]:bg-yellow-600'
                            : '[&>div]:bg-red-600'
                        }
                      />
                    </div>
                  );
                })}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Fix
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Flag
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={onGenerateReport}
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
