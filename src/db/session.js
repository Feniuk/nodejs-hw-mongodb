import { model, Schema } from 'mongoose';

const sessionsSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
  },
  { timestamps: true, versionKey: false },
);

export const Session = model('sessions', sessionsSchema);
