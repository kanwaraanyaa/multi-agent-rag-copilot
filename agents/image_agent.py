import torch
import torchxrayvision as xrv


def image_agent(image_path):

    print("Loading chest X-ray...")

    # --------------------------------------------------
    # 1. Load X-ray using TorchXRayVision preprocessing
    # --------------------------------------------------

    img = xrv.utils.load_image(image_path)

    print(
        f"Loaded image shape: {img.shape}"
    )

    print(
        f"Loaded image range: "
        f"[{img.min():.4f}, {img.max():.4f}]"
    )

    # --------------------------------------------------
    # 2. X-ray preprocessing
    # --------------------------------------------------

    img = xrv.datasets.XRayCenterCrop()(img)

    img = xrv.datasets.XRayResizer(224)(img)

    print(
        f"Processed image shape: {img.shape}"
    )

    print(
        f"Processed image range: "
        f"[{img.min():.4f}, {img.max():.4f}]"
    )

    # --------------------------------------------------
    # 3. Convert to PyTorch tensor
    # --------------------------------------------------

    img_tensor = torch.from_numpy(img).float()

    # TorchXRayVision expects:
    # [batch, channels, height, width]

    if img_tensor.ndim == 3:
        img_tensor = img_tensor.unsqueeze(0)

    print(
        f"Model input shape: {img_tensor.shape}"
    )

    # --------------------------------------------------
    # 4. Load X-ray model
    # --------------------------------------------------

    print("Loading X-ray model...")

    model = xrv.models.DenseNet(
        weights="densenet121-res224-all"
    )

    model.eval()

    # --------------------------------------------------
    # 5. Run inference
    # --------------------------------------------------

    print("Running image analysis...")

    with torch.no_grad():

        output = model(
            img_tensor
        )

    print(
        f"Model output shape: {output.shape}"
    )

    # Output should be:
    # [1, 18]

    scores = output[0].cpu().numpy()

    # --------------------------------------------------
    # 6. Create pathology → score dictionary
    # --------------------------------------------------

    predictions = {}

    for pathology, score in zip(
        model.pathologies,
        scores
    ):

        predictions[pathology] = float(score)

    # --------------------------------------------------
    # 7. Sort by confidence score
    # --------------------------------------------------

    predictions = dict(
        sorted(
            predictions.items(),
            key=lambda x: x[1],
            reverse=True
        )
    )

    # --------------------------------------------------
    # 8. Print ALL predictions for debugging
    # --------------------------------------------------

    print("\nALL IMAGE PREDICTIONS:")

    for condition, score in predictions.items():

        print(
            f"{condition}: {score:.6f}"
        )

    # --------------------------------------------------
    # 9. Return result
    # --------------------------------------------------

    return {
        "status": "success",
        "image_path": image_path,
        "predictions": predictions
    }