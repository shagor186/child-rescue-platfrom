import { useMutation } from '@tanstack/react-query';
import * as api from '../api/predictApi';

export const usePredictImage = () => useMutation({ mutationFn: api.predictImage });
export const usePredictVideo = () => useMutation({ mutationFn: api.predictVideo });
export const usePredictWebcam = () => useMutation({ mutationFn: api.predictWebcam });