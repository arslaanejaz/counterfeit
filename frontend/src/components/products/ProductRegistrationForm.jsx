'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Package, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { productsAPI } from '@/services/api';
import { generateQRCode } from '@/services/qr';
import { Button, Input, Select, Textarea, ErrorMessage, LoadingSpinner } from '@/components/common';

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  productId: z.string().min(3, 'Product ID must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  expiryDate: z.string().optional(),
  originLocation: z.string().min(3, 'Origin location is required'),
  minTemperature: z.coerce.number().optional(),
  maxTemperature: z.coerce.number().optional(),
}).refine((data) => {
  if (data.minTemperature && data.maxTemperature) {
    return data.minTemperature < data.maxTemperature;
  }
  return true;
}, {
  message: 'Min temperature must be less than max temperature',
  path: ['maxTemperature'],
});

export default function ProductRegistrationForm() {
  const { registerProduct, account } = useWeb3();
  const [registrationState, setRegistrationState] = useState('idle'); // idle, registering, success, error
  const [registeredProduct, setRegisteredProduct] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data) => {
    try {
      setRegistrationState('registering');
      setError(null);

      // Step 1: Register on backend API
      const productData = {
        name: data.name,
        productId: data.productId,
        category: data.category,
        description: data.description,
        manufacturingDate: data.manufacturingDate,
        expiryDate: data.expiryDate || null,
        originLocation: data.originLocation,
        minTemperature: data.minTemperature || null,
        maxTemperature: data.maxTemperature || null,
      };

      const apiResponse = await productsAPI.create(productData);

      // Step 2: Register on blockchain (if Web3 is connected)
      if (account && registerProduct) {
        try {
          const txHash = await registerProduct({
            productId: data.productId,
            name: data.name,
            manufacturer: account,
          });

          // Update backend with blockchain hash
          await productsAPI.updateBlockchainHash(apiResponse.id, txHash);
        } catch (blockchainError) {
          console.error('Blockchain registration failed:', blockchainError);
          // Continue anyway - product is registered in backend
        }
      }

      // Step 3: Generate QR code
      const qrCode = await generateQRCode({
        productId: data.productId,
        id: apiResponse.id,
      });

      setQrCodeUrl(qrCode);
      setRegisteredProduct(apiResponse);
      setRegistrationState('success');

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to register product');
      setRegistrationState('error');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${registeredProduct?.productId || 'product'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegisterAnother = () => {
    reset();
    setRegistrationState('idle');
    setRegisteredProduct(null);
    setQrCodeUrl(null);
    setError(null);
  };

  // Success state
  if (registrationState === 'success') {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                Product Registered Successfully!
              </h2>
              <p className="text-slate-300">
                Your product has been registered on the blockchain and is ready for tracking.
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-6 pt-6 border-t border-green-500/30 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Product Name</p>
              <p className="font-semibold">{registeredProduct?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Product ID</p>
              <p className="font-semibold font-mono text-sm">{registeredProduct?.productId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Database ID</p>
              <p className="font-semibold font-mono text-sm">{registeredProduct?.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Category</p>
              <p className="font-semibold">{registeredProduct?.category}</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Your Product QR Code</h3>
            <div className="inline-block p-6 bg-white rounded-xl mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Product QR Code" className="w-64 h-64" />
            </div>
            <p className="text-slate-300 mb-4">
              Attach this QR code to your product packaging for easy verification
            </p>
            <Button onClick={handleDownloadQR} variant="primary" className="w-full sm:w-auto">
              <Download className="w-5 h-5 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleRegisterAnother} variant="outline" className="flex-1">
            Register Another Product
          </Button>
          <Button
            onClick={() => window.location.href = `/products/${registeredProduct?.id}`}
            variant="primary"
            className="flex-1"
          >
            View Product Details
          </Button>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {registrationState === 'error' && error && (
        <ErrorMessage
          message={error}
          onRetry={() => setRegistrationState('idle')}
        />
      )}

      {/* Product Name */}
      <Input
        label="Product Name"
        placeholder="e.g., Pfizer COVID-19 Vaccine"
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Product ID/SKU */}
      <Input
        label="Product ID / SKU"
        placeholder="e.g., PFZ-CV19-001"
        error={errors.productId?.message}
        {...register('productId')}
      />

      {/* Category */}
      <Select
        label="Category"
        error={errors.category?.message}
        {...register('category')}
      >
        <option value="">Select a category</option>
        <option value="PHARMACEUTICALS">Pharmaceuticals</option>
        <option value="ELECTRONICS">Electronics</option>
        <option value="LUXURY_GOODS">Luxury Goods</option>
        <option value="FOOD_BEVERAGE">Food & Beverage</option>
        <option value="AUTOMOTIVE">Automotive Parts</option>
        <option value="OTHER">Other</option>
      </Select>

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Detailed product description..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Manufacturing & Expiry Date */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Manufacturing Date"
          type="date"
          error={errors.manufacturingDate?.message}
          {...register('manufacturingDate')}
        />
        <Input
          label="Expiry Date (Optional)"
          type="date"
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />
      </div>

      {/* Origin Location */}
      <Input
        label="Origin Location"
        placeholder="e.g., New York, USA"
        error={errors.originLocation?.message}
        {...register('originLocation')}
      />

      {/* Temperature Requirements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Min Temperature (°C)"
          type="number"
          placeholder="e.g., -70"
          error={errors.minTemperature?.message}
          {...register('minTemperature')}
        />
        <Input
          label="Max Temperature (°C)"
          type="number"
          placeholder="e.g., -60"
          error={errors.maxTemperature?.message}
          {...register('maxTemperature')}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => window.location.href = '/'}
          disabled={isSubmitting || registrationState === 'registering'}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting || registrationState === 'registering'}
        >
          {registrationState === 'registering' ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Registering on Blockchain...
            </>
          ) : (
            <>
              <Package className="w-5 h-5 mr-2" />
              Register Product
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
