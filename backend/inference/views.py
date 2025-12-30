from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from PIL import Image
import io

from .predictor import predict_pil

class InferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        f = request.FILES.get("image")
        if not f:
            return Response(
                {"detail": "Missing image file. Use multipart/form-data with field name 'image'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        img = Image.open(io.BytesIO(f.read()))
        out = predict_pil(img)
        return Response(out)
