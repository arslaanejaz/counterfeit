'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Thermometer,
  Shield,
  Download,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { productsAPI, checkpointsAPI } from '@/services/api';
import {
  LoadingSpinner,
  StatusBadge,
  Button,
  ErrorMessage,
  Card,
} from '@/components/common';
import { formatDate, formatTemperature } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id;

  // Fetch product details
  const {
    data: { data: { product } = {} } = {},
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getById(productId),
    enabled: !!productId,
  });

  console.log('Product details:', product);

  // Fetch checkpoints
  const {
    data: checkpoints,
    isLoading: checkpointsLoading,
    error: checkpointsError,
  } = useQuery({
    queryKey: ['checkpoints', productId],
    queryFn: () => checkpointsAPI.getByProductId(productId),
    enabled: !!productId,
  });

  if (productLoading || checkpointsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-24">
          <ErrorMessage
            message={
              productError.response?.data?.message || 'Failed to load product'
            }
            onRetry={() => router.push('/dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-slate-950/95 backdrop-blur-sm shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">NexusChain</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Product Header */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {product.name}
                  </h1>
                  <StatusBadge status={product.status} />
                </div>
                <p className="text-slate-400 font-mono text-sm">
                  {product.productId}
                </p>
              </div>

              <Button variant="outline" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Product Info Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Category</p>
                <p className="font-semibold">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">
                  Manufacturing Date
                </p>
                <p className="font-semibold">
                  {formatDate(product.manufacturingDate)}
                </p>
              </div>
              {product.expiryDate && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Expiry Date</p>
                  <p className="font-semibold">
                    {formatDate(product.expiryDate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-400 mb-1">Origin</p>
                <p className="font-semibold">{product.originLocation}</p>
              </div>
              {product.currentLocation && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Current Location
                  </p>
                  <p className="font-semibold">{product.currentLocation}</p>
                </div>
              )}
              {(product.minTemperature || product.maxTemperature) && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Temperature Range
                  </p>
                  <p className="font-semibold">
                    {formatTemperature(product.minTemperature)} -{' '}
                    {formatTemperature(product.maxTemperature)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Description</p>
                <p className="text-slate-300">{product.description}</p>
              </div>
            )}

            {/* Blockchain Info */}
            {product.blockchainHash && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">
                  Blockchain Transaction
                </p>
                <p className="font-mono text-xs text-blue-400 break-all">
                  {product.blockchainHash}
                </p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkpoint Timeline */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Journey Timeline</h2>
                {user?.role === 'LOGISTICS' && (
                  <Button variant="primary" size="small">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Checkpoint
                  </Button>
                )}
              </div>

              {checkpointsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="medium" />
                </div>
              ) : checkpointsError ? (
                <ErrorMessage message="Failed to load checkpoints" />
              ) : !checkpoints || checkpoints.length === 0 ? (
                <Card className="text-center py-12">
                  <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No checkpoints recorded yet</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {checkpoints.map((checkpoint, index) => (
                    <div
                      key={checkpoint.id}
                      className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
                    >
                      {/* Timeline connector */}
                      {index < checkpoints.length - 1 && (
                        <div className="absolute left-8 top-full h-4 w-0.5 bg-slate-700" />
                      )}

                      <div className="flex gap-4">
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        </div>

                        {/* Checkpoint content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {checkpoint.location}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {formatDate(checkpoint.timestamp)}
                              </p>
                            </div>
                            <StatusBadge status={checkpoint.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {checkpoint.temperature && (
                              <div className="flex items-center gap-2 text-sm">
                                <Thermometer className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-300">
                                  {formatTemperature(checkpoint.temperature)}
                                </span>
                              </div>
                            )}
                            {checkpoint.latitude && checkpoint.longitude && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-400 font-mono text-xs">
                                  {checkpoint.latitude.toFixed(4)},{' '}
                                  {checkpoint.longitude.toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>

                          {checkpoint.notes && (
                            <p className="text-sm text-slate-400 mt-3 italic">
                              &ldquo;{checkpoint.notes}&rdquo;
                            </p>
                          )}

                          {checkpoint.handledBy && (
                            <p className="text-xs text-slate-500 mt-2">
                              Handled by: {checkpoint.handledBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* QR Code */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Product QR Code</h3>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <div className="w-full aspect-square bg-slate-200 flex items-center justify-center text-slate-400">
                      {/* qrCode: 
      'data:image/png;base64,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',
    */}
                    <Image
                      src={product.qrCode}

                      alt="QR Code"
                      width={400}
                      height={400}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </Card>

              {/* Stats */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Total Checkpoints
                    </span>
                    <span className="font-semibold">
                      {checkpoints?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Days in Transit
                    </span>
                    <span className="font-semibold">
                      {product.createdAt
                        ? Math.floor(
                            (new Date() - new Date(product.createdAt)) /
                              (1000 * 60 * 60 * 24),
                          )
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Temperature Alerts
                    </span>
                    <span className="font-semibold text-green-400">0</span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Verify on Blockchain
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
