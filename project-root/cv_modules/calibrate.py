import cv2
import numpy as np
from typing import List, Tuple, Union

from cv_modules.datatypes import CalibrationData

class ImageCalibration:
    """
    Classe per calibrare e togliere la distorsione dalle immagini di input.

    Questa classe permette di calcolare una matrice di omografia H basandosi su punti di controllo noti 
    e ad applicarla a una o più immagini per raddrizzarle.

    Attributes:
        scale_factor (float): pixel/mm nell'immagine finale
        matrix (np.ndarray): matrice di omografia (3x3) se calcolata. None se non calcolata.
        output_shape (Tuple[int, int]): dimensioni (larghezza, altezza) dell'immagine finale. 
    """

    def __init__(self, scale_factor: Union[float, None] = None) -> None:
        """
        Inizializza l'istanza ImageCalibration.

        Args:
            scale_factor (float): quanti pixel corrispondono a 1 mm. 
            Se impostato su None verrà calcolato automaticamente durante la calibrazione.
        """
        self.scale_factor: Union[float, None] = scale_factor
        self.matrix: Union[np.ndarray, None] = None
        self.output_shape: Tuple[int, int] = (0, 0)

    @staticmethod
    def compute_scale_factor(punti_pixel: List[Tuple[float, float]], punti_mm: List[Tuple[float, float]]) -> float:
        """
        Calcola il fattore di scala ottimale basandosi sulla geometria dei punti forniti.
        Serve per non perdere risoluzione durante la calibrazione.
        
        Misura la lunghezza in pixel del lato che appare più grande
        e la rapporta alla sua dimensione reale in millimetri, preservando la massima risoluzione.

        Args:
            punti_pixel (List[Tuple[float, float]]): Coordinate (x, y) nell'immagine distorta.
            punti_mm (List[Tuple[float, float]]): Coordinate reali (X, Y) in millimetri.

        Returns:
            float: Il fattore di scala calcolato [pixel/mm].

        Raises:
            ValueError: Se sono presenti meno di 2 punti.
            ZeroDivisionError: Se la distanza in millimetri fra i primi due punti risulta essere zero.
        """
        if len(punti_pixel) < 2 or len(punti_mm) < 2:
            raise ValueError("Sono necessari almeno 2 punti per calcolare il fattore di scala.")
        
        # Applicazione del Teorema di Pitagora

        # pixel
        d_pixel_top = np.sqrt((punti_pixel[1][0] - punti_pixel[0][0])**2 + 
                              (punti_pixel[1][1] - punti_pixel[0][1])**2)
        if len(punti_pixel) >= 4:
            d_pixel_bottom = np.sqrt((punti_pixel[2][0] - punti_pixel[3][0])**2 + 
                                 (punti_pixel[2][1] - punti_pixel[3][1])**2)
            max_d_pixel = max(d_pixel_top, d_pixel_bottom)
        else:
            max_d_pixel = d_pixel_top

        # mm
        d_mm = np.sqrt((punti_mm[1][0] - punti_mm[0][0])**2 + 
                       (punti_mm[1][1] - punti_mm[0][1])**2)
        
        if d_mm == 0:
            raise ZeroDivisionError("La distanza in millimetri tra i primi due punti non può essere zero.")
        
        return float(max_d_pixel / d_mm)

    def find_homography(self, punti_pixel: List[Tuple[float, float]], punti_mm: List[Tuple[float, float]]) -> CalibrationData:
        """
        Calcola la matrice omografica usando una lista di punti di controllo numerati.

        Usa l'algoritmo RANSAC per garantire robustezza contro eventuali errori di misura.
        Il punto in mm più in alto a sinistra deve essere impostato a (0, 0).

        Args:
            punti_pixel (List[Tuple[float, float]]): Coordinate (x, y) nell'immagine distorta.
            punti_mm (List[Tuple[float, float]]): Coordinate reali (X, Y) in millimetri.

        Returns:
            CalibrationData: La dataclass contenente matrice, scala e risoluzione finale.

        Raises:
            ValueError: Se il numero di punti in pixel non corrisponde a quello in millimetri
                        o se sono presenti meno di 4 punti.
        """
        if len(punti_pixel) != len(punti_mm):
            raise ValueError("Il numero di punti virtuali e reali deve coincidere.")
        if len(punti_pixel) < 4:
            raise ValueError("Sono necessari almeno 4 punti per calcolare l'omografia.")
        
        # Se lo scale factor non è impostato, viene calcolato automaticamente
        if self.scale_factor is None:
            self.scale_factor = self.compute_scale_factor(punti_pixel, punti_mm)
            print(f"[INFO] Scale factor calcolato automaticamente: {self.scale_factor:.4f} px/mm.")
        
        src_pts = np.array(punti_pixel, dtype=np.float32)
        dst_pts = np.array(punti_mm, dtype=np.float32) * self.scale_factor

        # Determinazione delle dimensioni dell'immagine finale
        width = int(np.max(dst_pts[:, 0]))
        height = int(np.max(dst_pts[:, 1]))
        self.output_shape = (width, height)

        # Calcolo della matrice H
        self.matrix, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        inliers = np.sum(mask)
        print(f"[INFO] Calibrazione completata. Punti validi (inliers): {inliers} / {len(src_pts)}")

        return CalibrationData(
            matrix = self.matrix,
            scale_factor = self.scale_factor,
            output_shape = self.output_shape
        )

    def undistort_image(self, image: np.ndarray) -> np.ndarray:
        """
        Applica la trasformazione prospettica memorizzata a una nuova immagine.

        Args:
            image (np.ndarray): L'immagine originale da correggere.

        Returns:
            np.ndarray: L'immagine raddrizzata e corretta.

        Raises:
            RuntimeError: Se il metodo viene chiamato prima di aver eseguito 'find_homography'.
        """
        if self.matrix is None:
            raise RuntimeError("La classe deve essere calibrata tramite il metodo 'find_homography' prima dell'uso.")
        
        return cv2.warpPerspective(image, self.matrix, self.output_shape)
    
    def transform_points(self, punti_pixel: (List[Tuple[float, float]])) -> List[List[int]]:
        """
        Calcola la nuova posizione di una lista di punti sull'immagine raddrizzata.

        Args:
            punti_pixel ((List[Tuple[float, float]])): Lista di coordinate (x, y) originali.

        Returns:
            List[List[int]]: Nuove coordinate intere (np.int64) nell'immagine raddrizzata.

        Raises:
            RuntimeError: Se la classe non è ancora stata calibrata.
        """
        if self.matrix is None:
            raise RuntimeError("La classe deve essere calibrata tramite il metodo 'find_homography' prima dell'uso.")
        
        # 1. Trasformazione geometrica
        pts = np.array(punti_pixel, dtype=np.float32).reshape(-1,1,2)
        projected_pts = cv2.perspectiveTransform(pts, self.matrix).reshape(-1,2)

        # 2. Arrotondo all'intero più vicino
        rounded_pts = np.round(projected_pts)

        # 3. Converto l'intero array nel tipo np.int64
        array_int = rounded_pts.astype(np.int64)

        # 4. Creo una lista di liste contenente gli oggetti np.int64
        output_list = [[np.int64(x), np.int64(y)] for x,y in array_int]

        return output_list
    
    def calibrate(self, image: np.ndarray, punti_pixel: (List[Tuple[float, float]]), punti_mm: (List[Tuple[float, float]])) -> CalibrationData:
        """
        Metodo All-In-One per la calibrazione dell'immagine.
        Gestisce automaticamente calibrazione, raddrizzamento e mappatura dei punti.

        Args:
            image (np.ndarray): L'immagine originale da elaborare.
            punti_pixel (List[Tuple[float, float]]): Coordinate (x, y) nell'immagine distorta.
            punti_mm (List[Tuple[float, float]]): Coordinate reali (X, Y) in millimetri.

        Returns:
            CalibrationData: Oggetto contenente l'immagine raddrizzata (np.ndarray), i nuovi punti e i dati di calibrazione.
        """
        # 1. Trova la matrice omografica ( e lo scale_factor se non presente)
        calib_info = self.find_homography(punti_pixel, punti_mm)

        # 2. Raddrizza l'immagine
        undistorted_img = self.undistort_image(image)

        # 3. Converte i punti di riferimento nelle nuove coordinate
        new_points = self.transform_points(punti_pixel)

        # 4. Impacchetta tutto in un dizionario standard
        return CalibrationData(
            undistorted_img = undistorted_img,
            projected_points = new_points,
            calibration_info = calib_info
        )