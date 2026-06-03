class Pipeline:
    """
    MOCK PIPELINE:
    Questa classe rappresenta la logica teorica del sistema.
    Non viene usata runtime dal frontend.
    Serve solo come separazione concettuale.
    """

    def __init__(self):
        self.description = "Mock pipeline per gestione punti e immagini"

    def add_point(self, x, y):
        print(f"[PIPELINE MOCK] punto ricevuto: {x}, {y}")

    def save(self):
        print("[PIPELINE MOCK] salvataggio simulato")

    def reset(self):
        print("[PIPELINE MOCK] reset simulato")