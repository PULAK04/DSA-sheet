import mongoose from 'mongoose';

export async function connectDB(uri) {
  try {
    console.log(
      'MongoDB URI loaded:',
      uri
        ? `${uri.slice(0, 25)}...`
        : 'MISSING'
    );

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(
      'MongoDB connection failed:'
    );

    console.error(
      'Name:',
      error.name
    );

    console.error(
      'Message:',
      error.message
    );

    if (error.reason) {
      console.error(
        'Reason:',
        error.reason
      );
    }

    throw error;
  }
}