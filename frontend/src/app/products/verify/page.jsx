'use client';

import { useState } from 'react';
import {
  QrCode,
  Search,
  Package,
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/services/api';
import { Button, LoadingSpinner } from '@/components/common';

export default function VerifyProductPage() {
  const router = useRouter();
  const [productId, setProductId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!productId.trim()) return;

    try {
      setScanning(true);
      setError(null);

      // Try to verify by product ID
      const product = await productsAPI.verify(productId);

      if (product) {
        setVerificationResult({
          verified: true,
          product: product,
        });
      } else {
        setVerificationResult({
          verified: false,
          product: null,
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationResult({
        verified: false,
        product: null,
      });
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setScanning(false);
    }
  };

  const handleScanQR = () => {
    // This would open QR scanner in a real implementation
    alert(
      'QR Scanner would open here. Camera integration with @zxing/browser library will be added.',
    );
  };

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

            <Link
              href="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
              <QrCode className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Verify Product Authenticity
            </h1>
            <p className="text-xl text-slate-300">
              Scan QR code or enter Product ID to verify authenticity
            </p>
          </div>

          {/* Verification Input */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-8">
            <div className="space-y-6">
              {/* Product ID Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product ID or Serial Number
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="e.g., PFZ-CV19-001-XYZ123"
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={!productId.trim() || scanning}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    {scanning ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/50 text-slate-400">
                    OR
                  </span>
                </div>
              </div>

              {/* QR Scanner Button */}
              <button
                onClick={handleScanQR}
                className="w-full px-6 py-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition font-semibold flex items-center justify-center gap-3"
              >
                <QrCode className="w-6 h-6" />
                Scan QR Code with Camera
              </button>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`border rounded-xl p-8 ${
                verificationResult.verified
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                {verificationResult.verified ? (
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      verificationResult.verified
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {verificationResult.verified
                      ? 'Product Verified ✓'
                      : 'Product Not Found ✗'}
                  </h2>
                  <p className="text-slate-300">
                    {verificationResult.verified
                      ? 'This product is authentic and registered on the blockchain'
                      : 'This product could not be verified. It may be counterfeit.'}
                  </p>
                </div>
              </div>

              {verificationResult.verified && verificationResult.product && (
                <div className="space-y-4 border-t border-slate-700 pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Product Name
                      </p>
                      <p className="font-semibold">
                        {verificationResult.product.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Product ID</p>
                      <p className="font-semibold font-mono text-sm">
                        {verificationResult.product.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Manufacturer
                      </p>
                      <p className="font-semibold">
                        {verificationResult.product.manufacturer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Category</p>
                      <p className="font-semibold">
                        {verificationResult.product.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Current Status
                      </p>
                      <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">
                        {verificationResult.product.status}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Manufacturing Date
                      </p>
                      <p className="font-semibold">
                        {verificationResult.product.manufacturingDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Checkpoints Recorded
                      </p>
                      <p className="font-semibold">
                        {verificationResult.product.checkpoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Current Location
                      </p>
                      <p className="font-semibold">
                        {verificationResult.product.currentLocation}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/products/${verificationResult.product.id}`,
                        )
                      }
                    >
                      <Package className="w-5 h-5 mr-2" />
                      View Complete Product Journey
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">
              How does verification work?
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                ✓ Each authentic product has a unique QR code linked to
                blockchain
              </li>
              <li>
                ✓ Verification happens instantly by checking blockchain records
              </li>
              <li>
                ✓ You can see the complete journey from manufacturer to current
                location
              </li>
              <li>
                ✓ Counterfeit products will not have valid blockchain records
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
