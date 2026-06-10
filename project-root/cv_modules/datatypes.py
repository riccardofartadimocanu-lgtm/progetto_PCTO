from dataclasses import dataclass
import numpy as np
from typing import List, Tuple

@dataclass(frozen=True)
class CalibrationData:
    """
    Contiene i dati estratti dalla prima calibrazione.

    Attributes:
        scale_factor (float): pixel/mm nell'immagine finale
        matrix (np.ndarray): matrice di omografia (3x3) se calcolata. None se non calcolata.
        output_shape (Tuple[int, int]): dimensioni (larghezza, altezza) dell'immagine finale. 
    """
    matrix: np.ndarray
    scale_factor: float
    output_shape: Tuple[int, int]

@dataclass(frozen=True)
class CalibrationOutput:
    """
    Contiene l'output completo della fase 1 di calibrazione.

    Attributes:
        undistorted_img (np.ndarray): L'immagine corretta e raddrizzata.
        projected_points (List[List[int]]): Le nuove coordinate dei punti di riferimento (np.int64)
        calibrazione_info (CalibrationData): Metadati di calibrazione (matrice, scala, shape). 
    """
    undistorted_img: np.ndarray
    projected_points: List[List[int]]
    calibration_info: CalibrationData

@dataclass(frozen=True)
class DetectedObject:
    """
    Rappresenta l'oggetto finale localizzato nello spazio reale.

    Attributes:
        object_id (int): pixel/mm nell'immagine finale
        label (str): matrice di omografia (3x3) se calcolata. None se non calcolata.
        confidence (float): Confidence score del modello YOLO (0.0 - 1.0)
        x_reale_mm (float): Coordinata X rispetto al punto noto più vicino
        y_reale_mm (float): Coordinata Y rispetto al punto noto più vicino
        angolo_alpha (float): Orientamento in gradi (0-360)
        grid_reference_point (int): ID o indice del punto noto più vicino usato come origine locale
    """    
    object_id: int
    label: str
    confidence: float
    x_reale_mm: float
    y_reale_mm: float
    angolo_alpha: float
    grid_reference_point: int 